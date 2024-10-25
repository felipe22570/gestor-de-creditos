"use client";

import { Credit } from "@/types/schema";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<Credit>[] = [
	{
		accessorKey: "startDate",
		header: "Fecha",
		cell: ({ row }) => {
			const date = format(new Date(row.getValue("startDate")), "dd/MM/yyyy");

			return <span className="w-3 text-sm font-medium">{date}</span>;
		},
		maxSize: 10,
	},
	{
		accessorKey: "clientCardId",
		header: "Cédula",
	},
	{
		accessorKey: "clientName",
		header: "Nombre",
	},
	{
		accessorKey: "clientPhone",
		header: "Teléfono",
	},
	{
		accessorKey: "productName",
		header: "Producto",
	},
	{
		accessorKey: "initialAmount",
		header: "Monto Inicial",
		cell: ({ row }) => {
			const formatted = new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: "COP",
			}).format(row.getValue("initialAmount"));

			return <span className="text-sm font-medium">{formatted}</span>;
		},
	},
	{
		accessorKey: "interestRate",
		header: "Tasa",
		cell: ({ row }) => {
			return <span className="text-sm font-medium">{row.getValue("interestRate")}%</span>;
		},
	},
	{
		accessorKey: "totalAmount",
		header: "Monto Total",
		cell: ({ row }) => {
			const formatted = new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: "COP",
			}).format(row.getValue("totalAmount"));

			return <span className="text-sm font-medium">{formatted}</span>;
		},
	},
];

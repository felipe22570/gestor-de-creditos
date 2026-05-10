"use client";

import { flexRender, Table as ReactTable } from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
	table: ReactTable<TData>;
	showFooter?: boolean;
	footerContent?: React.ReactNode;
}

// Special-case the row-selection column: keep it narrow and don't waste
// horizontal space on cell padding around a 18px checkbox.
const selectColumnClass = "w-12 px-3";

export function DataTable<TData>({ table, showFooter = false, footerContent }: DataTableProps<TData>) {
	return (
		<div>
			<div className="rounded-card border border-border bg-surface overflow-hidden">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={cn(
											header.column.id === "select" && selectColumnClass
										)}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												cell.column.id === "select" && selectColumnClass
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getVisibleLeafColumns().length}
									className="h-24 text-center text-text-secondary"
								>
									Sin resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					{showFooter && footerContent && <TableFooter>{footerContent}</TableFooter>}
				</Table>
			</div>
		</div>
	);
}

"use client";

import { AlertCircleIcon, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/actions/admin";

type FormInputs = {
	name: string;
	email: string;
	phone: string;
	password: string;
	repeatPassword: string;
};

export default function RegisterForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [showRepeatPassword, setShowRepeatPassword] = useState(false);
	const [passwordMatch, setPasswordMatch] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	const [user, setUser] = useState<FormInputs>({
		name: "",
		email: "",
		phone: "",
		password: "",
		repeatPassword: "",
	});

	const togglePasswordVisibility = (field: "password" | "repeatPassword") => {
		if (field === "password") {
			setShowPassword(!showPassword);
		} else {
			setShowRepeatPassword(!showRepeatPassword);
		}
	};

	const onRegisterUser = async (e: React.FormEvent) => {
		e.preventDefault();

		if (user.password !== user.repeatPassword) {
			setPasswordMatch(false);
			return;
		}

		setPasswordMatch(true);
		setIsLoading(true);
		try {
			await registerUser(user);
			window.location.replace("/login");
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Crear cuenta</CardTitle>
				<CardDescription>Regístrate para empezar a gestionar tus créditos</CardDescription>
			</CardHeader>
			<form onSubmit={onRegisterUser}>
				<CardContent className="space-y-4">
					{!passwordMatch && (
						<div
							role="alert"
							className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-small text-destructive"
						>
							<AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
							<span>Las contraseñas no coinciden</span>
						</div>
					)}

					<div className="space-y-1.5">
						<Label htmlFor="name">Nombre</Label>
						<Input
							id="name"
							name="name"
							value={user.name}
							onChange={(e) => setUser({ ...user, name: e.target.value })}
							placeholder="Tu nombre completo"
							required
							disabled={isLoading}
							autoComplete="name"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="email">Correo</Label>
						<Input
							id="email"
							type="email"
							name="email"
							value={user.email}
							onChange={(e) => setUser({ ...user, email: e.target.value })}
							placeholder="tu@correo.com"
							required
							disabled={isLoading}
							autoComplete="email"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="phone">Teléfono</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="3001234567"
							name="phone"
							value={user.phone}
							onChange={(e) => setUser({ ...user, phone: e.target.value })}
							required
							disabled={isLoading}
							autoComplete="tel"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="password">Contraseña</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								name="password"
								placeholder="••••••••"
								value={user.password}
								onChange={(e) => setUser({ ...user, password: e.target.value })}
								required
								disabled={isLoading}
								className="pr-10"
								aria-invalid={!passwordMatch ? true : undefined}
								autoComplete="new-password"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
								onClick={() => togglePasswordVisibility("password")}
								aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
								tabIndex={-1}
							>
								{showPassword ? (
									<EyeOffIcon className="h-4 w-4 text-muted-foreground" />
								) : (
									<EyeIcon className="h-4 w-4 text-muted-foreground" />
								)}
							</Button>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="repeatPassword">Repetir contraseña</Label>
						<div className="relative">
							<Input
								id="repeatPassword"
								type={showRepeatPassword ? "text" : "password"}
								placeholder="••••••••"
								value={user.repeatPassword}
								onChange={(e) =>
									setUser({ ...user, repeatPassword: e.target.value })
								}
								required
								disabled={isLoading}
								className="pr-10"
								aria-invalid={!passwordMatch ? true : undefined}
								autoComplete="new-password"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
								onClick={() => togglePasswordVisibility("repeatPassword")}
								aria-label={
									showRepeatPassword
										? "Ocultar repetición de contraseña"
										: "Mostrar repetición de contraseña"
								}
								tabIndex={-1}
							>
								{showRepeatPassword ? (
									<EyeOffIcon className="h-4 w-4 text-muted-foreground" />
								) : (
									<EyeIcon className="h-4 w-4 text-muted-foreground" />
								)}
							</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
					<Button
						variant="ghost"
						type="button"
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						Cancelar
					</Button>
					<Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
						{isLoading ? (
							<>
								<Loader2Icon className="mr-1 h-4 w-4 animate-spin" />
								Procesando...
							</>
						) : (
							"Crear cuenta"
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

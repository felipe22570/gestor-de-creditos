"use client";

import { AuthError } from "next-auth";
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
import { login } from "@/lib/actions/admin";

export default function LoginForm() {
	const [user, setUser] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const onChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUser({ ...user, [e.target.name]: e.target.value });
		if (error) setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await login(user);
			window.location.replace("/dashboard");
		} catch (error) {
			console.error(error);
			if (error instanceof AuthError) {
				switch (error.type) {
					case "CredentialsSignin":
						setError(
							"Credenciales incorrectas. Por favor, verifica tu correo y contraseña."
						);
						break;
					default:
						setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
				}
			} else {
				setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full">
			<form onSubmit={handleSubmit}>
				<CardHeader>
					<CardTitle>Iniciar sesión</CardTitle>
					<CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div
							role="alert"
							className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-small text-destructive"
						>
							<AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
							<span>{error}</span>
						</div>
					)}

					<div className="space-y-1.5">
						<Label htmlFor="email">Correo</Label>
						<Input
							id="email"
							name="email"
							value={user.email}
							onChange={onChangeData}
							type="email"
							placeholder="tu@correo.com"
							required
							disabled={isLoading}
							aria-invalid={error ? true : undefined}
							autoComplete="email"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="password">Contraseña</Label>
						<div className="relative">
							<Input
								id="password"
								name="password"
								value={user.password}
								onChange={onChangeData}
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								required
								disabled={isLoading}
								aria-invalid={error ? true : undefined}
								className="pr-10"
								autoComplete="current-password"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
								onClick={togglePasswordVisibility}
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
				</CardContent>
				<CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
					<Button variant="ghost" type="button" disabled={isLoading} className="w-full sm:w-auto">
						Cancelar
					</Button>
					<Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
						{isLoading ? (
							<>
								<Loader2Icon className="mr-1 h-4 w-4 animate-spin" />
								Procesando...
							</>
						) : (
							"Ingresar"
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

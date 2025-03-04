"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { login } from "@/lib/actions/admin";
import { AuthError } from "next-auth";

export default function Component() {
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
		// Clear error when user starts typing again
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
		<Card className="w-full max-w-md mx-auto">
			<form onSubmit={handleSubmit}>
				<CardHeader>
					<CardTitle className="text-2xl mb-3">Iniciar sesión</CardTitle>
					<CardDescription>Ingresa tus credenciales para ingresar a tu cuenta</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid w-full items-center gap-4">
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="email">Correo</Label>

							<Input
								id="email"
								name="email"
								value={user.email}
								onChange={onChangeData}
								type="email"
								placeholder="Ingresa tu correo"
								required
								className={error ? "border-red-500" : ""}
							/>
						</div>
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="password">Contraseña</Label>
							<div className="relative">
								<Input
									id="password"
									name="password"
									value={user.password}
									onChange={onChangeData}
									type={showPassword ? "text" : "password"}
									placeholder="Ingresa tu contraseña"
									required
									className={error ? "border-red-500" : ""}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={togglePasswordVisibility}
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeOffIcon className="h-4 w-4" />
									) : (
										<EyeIcon className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						{error && <div className="text-red-500 text-sm mt-1">{error}</div>}
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline" type="button">
						Cancelar
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Procesando..." : "Ingresar"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

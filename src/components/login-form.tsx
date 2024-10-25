"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { login } from "@/lib/actions/admin";

export default function Component() {
	const [user, setUser] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const onChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		await login(user);

		window.location.replace("/dashboard");
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
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline">Cancelar</Button>
					<Button type="submit">Ingresar</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

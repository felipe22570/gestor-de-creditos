"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { registerUser } from "@/lib/actions/admin";

type FormInputs = {
	name: string;
	email: string;
	phone: string;
	password: string;
	repeatPassword: string;
};

export default function Component() {
	const [showPassword, setShowPassword] = useState(false);
	const [showRepeatPassword, setShowRepeatPassword] = useState(false);
	const [passwordMatch, setPasswordMatch] = useState(true);

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
			return null;
		}

		await registerUser(user);

		window.location.replace("/login");
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl mb-3">Registro</CardTitle>
				<CardDescription>Crea una nueva cuenta</CardDescription>
			</CardHeader>
			<form onSubmit={onRegisterUser}>
				<CardContent>
					<div className="grid w-full items-center gap-4">
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="name">Nombre</Label>
							<Input
								id="name"
								name="name"
								value={user.name}
								onChange={(e) => setUser({ ...user, name: e.target.value })}
								placeholder="Ingresa tu nombre completo"
								required
							/>
						</div>
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="email">Correo</Label>
							<Input
								id="email"
								type="email"
								name="email"
								value={user.email}
								onChange={(e) => setUser({ ...user, email: e.target.value })}
								placeholder="Ingresa tu correo"
								required
							/>
						</div>
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="phone">Teléfono</Label>
							<Input
								id="phone"
								type="number"
								placeholder="(123) 456-7890"
								name="phone"
								value={user.phone}
								onChange={(e) => setUser({ ...user, phone: e.target.value })}
								required
							/>
						</div>
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="password">Contraseña</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="Ingresa tu contraseña"
									value={user.password}
									onChange={(e) => setUser({ ...user, password: e.target.value })}
									required
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => togglePasswordVisibility("password")}
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
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="repeatPassword">Repetir contraseña</Label>
							<div className="relative">
								<Input
									id="repeatPassword"
									type={showRepeatPassword ? "text" : "password"}
									placeholder="Repite tu contraseña"
									value={user.repeatPassword}
									onChange={(e) =>
										setUser({ ...user, repeatPassword: e.target.value })
									}
									// onChange={handleRepeatPasswordChange}
									required
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => togglePasswordVisibility("repeatPassword")}
									aria-label={
										showRepeatPassword
											? "Hide repeat password"
											: "Show repeat password"
									}
								>
									{showRepeatPassword ? (
										<EyeOffIcon className="h-4 w-4" />
									) : (
										<EyeIcon className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						{!passwordMatch && (
							<p className="text-sm text-red-500">Las contraseñas no coinciden</p>
						)}
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline">Cancelar</Button>
					<Button type="submit">Registrar</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

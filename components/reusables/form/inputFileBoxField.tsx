"use client";
import React, { useCallback, useState } from "react";
import { cn } from "@/lib";
import Image from "next/image";
import { Camera, X } from "lucide-react";

interface InputFileBoxFieldProps {
	label: string;
	htmlFor: string;
	id: string;
	isInvalid: boolean;
	errorMessage: string;
	reqValue?: string;
	onChange: (file: File | null) => void;
	required?: boolean;
}

const InputFileBoxField: React.FC<InputFileBoxFieldProps> = ({ id, isInvalid, errorMessage, onChange, required }) => {
	const [preview, setPreview] = useState<string | null>(null);
	const [isDragActive, setIsDragActive] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onChange(file);
			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(true);
	};

	const handleDragLeave = () => {
		setIsDragActive(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(false);
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) {
			onChange(file);
			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		setPreview(null);
		onChange(null);
	};

	return (
		<div className="flex flex-col space-y-1.5">
			{/*<div>
				<Label
					htmlFor={htmlFor}
					className={cn("text-sm text-black", GeneralSans_Meduim.className)}>
					{label} <sup className="text-danger">{reqValue}</sup>
				</Label>
				<p className="text-xs text-gray-400 mb-2">Please provide a clear photo of yourself with good lighting</p>
			</div>*/}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => document.getElementById(id)?.click()}
				className={cn("border-2 border-dashed rounded-lg p-6 cursor-pointer min-h-[200px] relative", "flex flex-col items-center justify-center text-center", "hover:border-primary transition-colors", isDragActive ? "border-primary bg-primary/5" : "border-gray-300")}>
				<input
					type="file"
					id={id}
					required={required}
					accept="image/jpeg,image/jpg,image/png"
					onChange={handleFileChange}
					className="hidden"
				/>

				{preview ? (
					<div className="absolute inset-0 m-1">
						<div className="relative w-full h-full">
							<Image
								src={preview}
								alt="Preview"
								fill
								className="object-cover rounded-lg"
							/>
							<button
								onClick={handleRemove}
								className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
								type="button">
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				) : (
					<div className="w-16 h-16 rounded-full  text-blue-600 flex items-center justify-center mx-auto">
						<Camera className="w-10 h-10" />
					</div>
				)}
			</div>
			{isInvalid && <div className="text-red-500">{errorMessage}</div>}
		</div>
	);
};

export default InputFileBoxField;

import { z } from "zod";

export type Meta = {
  count: number;
};

export const LocationTypeSchema = z.enum(["National", "International"]);
export const ProvinceSchema = z.enum([
	"Koshi",
	"Madhesh",
	"Bagmati",
	"Gandaki",
	"Lumbini",
	"Karnali",
	"Sudurpaschim",
]);

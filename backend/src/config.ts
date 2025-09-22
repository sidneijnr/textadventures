import "dotenv/config";
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import z from "zod";

extendZodWithOpenApi(z);
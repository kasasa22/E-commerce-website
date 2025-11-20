-- Migration: Remove brand, type, and category columns from products table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.products 
DROP COLUMN IF EXISTS brand,
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS category;

DROP INDEX IF EXISTS idx_products_category;


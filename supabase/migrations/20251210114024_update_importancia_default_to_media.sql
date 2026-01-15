-- Migration: Update importancia default value to 'Media'
-- Description: Changes the default value of importancia column from 'Base' to 'Media'
-- Author: Auto-generated
-- Date: 2025-01-31

-- Alter the default value of importancia column
ALTER TABLE public.modulos
    ALTER COLUMN importancia SET DEFAULT 'Media';;

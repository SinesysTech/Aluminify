-- Migration: Ensure professor record exists on login
-- Description: Creates a function to automatically create/update professor record when they log in
-- Author: Auto-generated
-- Date: 2025-01-28

-- 1. Create function to ensure professor record exists
-- This function will be called after login to guarantee the professor has a record
CREATE OR REPLACE FUNCTION public.ensure_professor_record()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_email TEXT;
BEGIN
    -- Get user role from metadata
    user_role := NEW.raw_user_meta_data->>'role';
    user_email := NEW.email;
    
    -- Only proceed if user is a professor
    IF user_role = 'professor' OR user_role = 'superadmin' THEN
        -- Check if professor record already exists
        IF NOT EXISTS (SELECT 1 FROM public.professores WHERE id = NEW.id) THEN
            -- Insert new professor record with email
            INSERT INTO public.professores (id, email, nome_completo)
            VALUES (
                NEW.id,
                COALESCE(user_email, ''),
                COALESCE(
                    NEW.raw_user_meta_data->>'full_name',
                    NEW.raw_user_meta_data->>'name',
                    split_part(COALESCE(user_email, ''), '@', 1),
                    'Novo Professor'
                )
            )
            ON CONFLICT (id) DO UPDATE
            SET 
                email = EXCLUDED.email,
                updated_at = NOW();
        ELSE
            -- Update email if it has changed
            UPDATE public.professores
            SET 
                email = COALESCE(user_email, email),
                updated_at = NOW()
            WHERE id = NEW.id
            AND (email IS DISTINCT FROM user_email);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function that can be called manually to ensure professor record
-- This is useful for existing users or when called from application code
CREATE OR REPLACE FUNCTION public.ensure_professor_record_for_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_email TEXT;
    user_full_name TEXT;
BEGIN
    -- Get user data from auth.users
    SELECT 
        raw_user_meta_data->>'role',
        email,
        COALESCE(
            raw_user_meta_data->>'full_name',
            raw_user_meta_data->>'name',
            split_part(email, '@', 1),
            'Novo Professor'
        )
    INTO user_role, user_email, user_full_name
    FROM auth.users
    WHERE id = user_id;
    
    -- Check if user exists
    IF user_email IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Only proceed if user is a professor
    IF user_role = 'professor' OR user_role = 'superadmin' THEN
        -- Insert or update professor record
        INSERT INTO public.professores (id, email, nome_completo)
        VALUES (
            user_id,
            user_email,
            user_full_name
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            nome_completo = COALESCE(NULLIF(professores.nome_completo, ''), EXCLUDED.nome_completo),
            updated_at = NOW();
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_professor_record_for_user(UUID) TO authenticated;

COMMENT ON FUNCTION public.ensure_professor_record() IS 'Trigger function to automatically create professor record on user creation';
COMMENT ON FUNCTION public.ensure_professor_record_for_user(UUID) IS 'Function to manually ensure professor record exists for a given user ID';

-- 4. Update handle_new_user() to ensure it always creates professor record correctly
-- This ensures the record is created on sign up as well
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Tenta ler o papel do usuário (ex: { "role": "professor" })
    user_role := new.raw_user_meta_data->>'role';

    IF user_role = 'professor' OR user_role = 'superadmin' THEN
        -- Insert professor record with email and basic info
        INSERT INTO public.professores (id, email, nome_completo)
        VALUES (
            new.id, 
            COALESCE(new.email, ''),
            COALESCE(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(COALESCE(new.email, ''), '@', 1),
                'Novo Professor'
            )
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            nome_completo = COALESCE(NULLIF(professores.nome_completo, ''), EXCLUDED.nome_completo),
            updated_at = NOW();
    ELSE
        -- Default: Se não vier nada ou vier 'aluno', cria como Aluno
        INSERT INTO public.alunos (id, email, nome_completo)
        VALUES (
            new.id, 
            COALESCE(new.email, ''),
            COALESCE(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(COALESCE(new.email, ''), '@', 1),
                'Novo Aluno'
            )
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            nome_completo = COALESCE(NULLIF(alunos.nome_completo, ''), EXCLUDED.nome_completo),
            updated_at = NOW();
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add RLS policy to allow professor record creation
-- This ensures users can insert their own professor record
DROP POLICY IF EXISTS "Professores podem criar seu próprio registro" ON public.professores;
CREATE POLICY "Professores podem criar seu próprio registro" ON public.professores 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Also ensure users can read their own professor record (in case they're not public yet)
DROP POLICY IF EXISTS "Usuários veem seu próprio registro de professor" ON public.professores;
CREATE POLICY "Usuários veem seu próprio registro de professor" ON public.professores 
    FOR SELECT 
    USING (auth.uid() = id OR true); -- Allow own record OR public (already exists)


-- Corrigir lógica: quando acumulativo_desde_inicio = true, sempre começa do módulo 1

CREATE OR REPLACE FUNCTION public.gerar_atividades_personalizadas(p_curso_id UUID, p_frente_id UUID)
RETURNS VOID AS $$
DECLARE
    r_regra RECORD;
    r_modulo RECORD;
    v_contador INTEGER;
    v_total_modulos INTEGER;
    v_titulo_final TEXT;
    v_modulo_inicio INTEGER;
BEGIN
    SELECT count(*) INTO v_total_modulos FROM public.modulos WHERE frente_id = p_frente_id;
    IF v_total_modulos = 0 THEN RETURN; END IF;

    DELETE FROM public.atividades WHERE modulo_id IN (SELECT id FROM public.modulos WHERE frente_id = p_frente_id);

    FOR r_regra IN SELECT * FROM public.regras_atividades WHERE curso_id = p_curso_id LOOP
        v_contador := 0;
        FOR r_modulo IN SELECT * FROM public.modulos WHERE frente_id = p_frente_id ORDER BY numero_modulo ASC LOOP
            v_contador := v_contador + 1;
            IF v_contador >= r_regra.comecar_no_modulo THEN
                IF ((v_contador - r_regra.comecar_no_modulo) % r_regra.frequencia_modulos = 0) THEN
                    IF r_regra.acumulativo THEN
                        -- Se acumulativo_desde_inicio = true, sempre começa do módulo 1
                        -- Se false, usa o intervalo baseado na frequência (comportamento original)
                        IF r_regra.acumulativo_desde_inicio THEN
                            v_modulo_inicio := 1;
                        ELSE
                            v_modulo_inicio := GREATEST(v_contador - r_regra.frequencia_modulos + 1, r_regra.comecar_no_modulo);
                        END IF;
                        
                        IF v_modulo_inicio = v_contador THEN
                            v_titulo_final := r_regra.nome_padrao || ' (Módulo ' || v_contador || ')';
                        ELSE
                            v_titulo_final := r_regra.nome_padrao || ' (Módulos ' || v_modulo_inicio || ' ao ' || v_contador || ')';
                        END IF;
                    ELSE
                        v_titulo_final := r_regra.nome_padrao;
                    END IF;
                    INSERT INTO public.atividades (modulo_id, tipo, titulo, ordem_exibicao) VALUES (r_modulo.id, r_regra.tipo_atividade, v_titulo_final, 10);
                END IF;
            END IF;
            IF r_regra.gerar_no_ultimo AND v_contador = v_total_modulos AND (v_contador < r_regra.comecar_no_modulo OR (v_contador - r_regra.comecar_no_modulo) % r_regra.frequencia_modulos <> 0) THEN
                v_titulo_final := r_regra.nome_padrao || ' (Final)';
                INSERT INTO public.atividades (modulo_id, tipo, titulo, ordem_exibicao) VALUES (r_modulo.id, r_regra.tipo_atividade, v_titulo_final, 99);
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;;

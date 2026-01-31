UPDATE public.profiles
SET is_premium = true,
    premium_expires_at = NOW() + INTERVAL '1 year'
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'florr.vallese@gmail.com'
);
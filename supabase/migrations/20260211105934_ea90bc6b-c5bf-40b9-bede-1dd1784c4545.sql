-- Allow users to update their own sync logs (needed by sync-platform edge function)
CREATE POLICY "Users can update their own sync logs"
ON public.sync_logs
FOR UPDATE
USING (auth.uid() = user_id);
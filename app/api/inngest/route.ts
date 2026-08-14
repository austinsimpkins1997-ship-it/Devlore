import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { analyzeUser } from '@/lib/inngest/functions/analyze-user';
import { generateChapter } from '@/lib/inngest/functions/generate-chapter';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeUser, generateChapter],
});

import { Inngest, EventSchemas } from 'inngest';

/**
 * Inngest event schema for DEVLORE.
 * Each event key must match the `name` field and include a `data` payload.
 * `name` is required by Inngest's EventPayload constraint.
 */
type DevloreEvents = {
  'devlore/user.analyze': {
    name: 'devlore/user.analyze';
    data: {
      userId: string;
      accessToken: string;
      triggeredBy?: 'manual' | 'github-push' | 'cron' | 'first_login';
    };
  };
  'devlore/chapter.generate': {
    name: 'devlore/chapter.generate';
    data: {
      userId: string;
      accessToken: string;
      weekStart: string;
      weekEnd: string;
    };
  };
  'devlore/github.push': {
    name: 'devlore/github.push';
    data: {
      userId: string;
      repo: string;
      sha: string;
      ref: string;
      message: string;
    };
  };
};

export const inngest = new Inngest({
  id: 'devlore',
  schemas: new EventSchemas<DevloreEvents>(),
});

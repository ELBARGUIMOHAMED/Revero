import {createClient} from '../../../../lib/supabase/server';
import {jsonUtf8} from '../../../../lib/http';

const SUPPORTED = new Set(['en', 'fr', 'ar']);

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonUtf8({error: 'Unauthorized'}, {status: 401});
  }

  const payload = (await request.json().catch(() => ({}))) as {locale?: string};
  const locale = payload.locale || '';

  if (!SUPPORTED.has(locale)) {
    return jsonUtf8({error: 'Invalid locale'}, {status: 400});
  }

  const {error} = await supabase.auth.updateUser({
    data: {
      locale,
    },
  });

  if (error) {
    return jsonUtf8({error: error.message}, {status: 400});
  }

  return jsonUtf8({ok: true});
}

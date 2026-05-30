import { validateSession } from '@/config/api-validation';
import { requireWorkspaceMember } from '@/lib/server/authorization';
import { getDomains } from '@/prisma/services/domain';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    const session = await validateSession(req, res);
    const workspace = await requireWorkspaceMember(
      req,
      res,
      session,
      req.query.workspaceSlug
    );

    if (!workspace) return;

    const domains = await getDomains(req.query.workspaceSlug);
    res.status(200).json({ data: { domains } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;

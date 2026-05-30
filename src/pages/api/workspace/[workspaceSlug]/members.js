import { validateSession } from '@/config/api-validation';
import { requireWorkspaceMember } from '@/lib/server/authorization';
import { getMembers } from '@/prisma/services/membership';

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

    const members = await getMembers(req.query.workspaceSlug);
    res.status(200).json({ data: { members } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;

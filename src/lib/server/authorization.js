import prisma from '@/prisma/index';
import { getOwnWorkspace, getWorkspace } from '@/prisma/services/workspace';

const unauthorized = (res) =>
  res
    .status(403)
    .json({ errors: { error: { msg: 'You do not have access to this workspace' } } });

export const requireWorkspaceOwner = async (req, res, session, slug) => {
  const workspace = await getOwnWorkspace(
    session.user.userId,
    session.user.email,
    slug
  );

  if (!workspace) {
    unauthorized(res);
    return null;
  }

  return workspace;
};

export const requireWorkspaceMember = async (req, res, session, slug) => {
  const workspace = await getWorkspace(
    session.user.userId,
    session.user.email,
    slug
  );

  if (!workspace) {
    unauthorized(res);
    return null;
  }

  return workspace;
};

export const requireMemberInOwnedWorkspace = async (
  req,
  res,
  session,
  memberId
) => {
  if (!memberId) {
    res
      .status(400)
      .json({ errors: { error: { msg: 'memberId is required' } } });
    return null;
  }

  const member = await prisma.member.findFirst({
    select: {
      id: true,
      teamRole: true,
      workspace: { select: { slug: true } },
    },
    where: { id: memberId, deletedAt: null },
  });

  if (!member || !member.workspace) {
    res
      .status(404)
      .json({ errors: { error: { msg: 'Member not found' } } });
    return null;
  }

  const workspace = await getOwnWorkspace(
    session.user.userId,
    session.user.email,
    member.workspace.slug
  );

  if (!workspace) {
    unauthorized(res);
    return null;
  }

  return { member, workspace };
};

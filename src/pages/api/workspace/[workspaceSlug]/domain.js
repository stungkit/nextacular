import { validateAddDomain, validateSession } from '@/config/api-validation';
import api from '@/lib/common/api';
import { requireWorkspaceOwner } from '@/lib/server/authorization';
import {
  createDomain,
  deleteDomain,
  verifyDomain,
} from '@/prisma/services/domain';

const handler = async (req, res) => {
  const { method } = req;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    await validateAddDomain(req, res);
    const workspace = await requireWorkspaceOwner(
      req,
      res,
      session,
      req.query.workspaceSlug
    );

    if (!workspace) return;

    const { domainName } = req.body;
    const response = await api(
      `${process.env.VERCEL_API_URL}/v9/projects/${
        process.env.VERCEL_PROJECT_ID
      }/domains${teamId ? `?teamId=${teamId}` : ''}`,
      {
        body: { name: domainName },
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
        },
        method: 'POST',
      }
    );

    if (!response.error) {
      const { apexName, verified, verification } = response;
      await createDomain(
        session.user.userId,
        session.user.email,
        req.query.workspaceSlug,
        domainName,
        apexName,
        verified,
        verification
      );
      res.status(200).json({ data: { domain: domainName } });
    } else {
      res
        .status(response.status)
        .json({ errors: { error: { msg: response.error.message } } });
    }
  } else if (method === 'PUT') {
    const session = await validateSession(req, res);
    const workspace = await requireWorkspaceOwner(
      req,
      res,
      session,
      req.query.workspaceSlug
    );

    if (!workspace) return;

    const { domainName } = req.body;
    const response = await api(
      `${process.env.VERCEL_API_URL}/v9/projects/${
        process.env.VERCEL_PROJECT_ID
      }/domains/${domainName}/verify${teamId ? `?teamId=${teamId}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
        },
        method: 'POST',
      }
    );

    if (!response.error) {
      await verifyDomain(
        session.user.userId,
        session.user.email,
        req.query.workspaceSlug,
        domainName,
        response.verified
      );
      res.status(200).json({ data: { verified: response.verified } });
    } else {
      res
        .status(response.status)
        .json({ errors: { error: { msg: response.error.message } } });
    }
  } else if (method === 'DELETE') {
    const session = await validateSession(req, res);
    const workspace = await requireWorkspaceOwner(
      req,
      res,
      session,
      req.query.workspaceSlug
    );

    if (!workspace) return;

    const { domainName } = req.body;
    await api(
      `${process.env.VERCEL_API_URL}/v8/projects/${
        process.env.VERCEL_PROJECT_ID
      }/domains/${domainName}${teamId ? `?teamId=${teamId}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
        },
        method: 'DELETE',
      }
    );
    await deleteDomain(
      session.user.userId,
      session.user.email,
      req.query.workspaceSlug,
      domainName
    );
    res.status(200).json({ data: { domain: domainName } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;

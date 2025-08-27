/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Transformers */

export const transformDebate = (debate) => ({
  ...debate,
  ...(debate.createdAt && {
    createdAt: new Date(debate.createdAt),
  }),
  ...(debate.updatedAt && {
    updatedAt: new Date(debate.updatedAt),
  }),
});

export const transformDebateReply = (reply) => ({
  ...reply,
  ...(reply.createdAt && {
    createdAt: new Date(reply.createdAt),
  }),
  ...(reply.updatedAt && {
    updatedAt: new Date(reply.updatedAt),
  }),
});

/* Actions */

const getDebates = (projectId, status, headers) => {
  const query = status ? `?status=${status}` : '';
  return socket.get(`/projects/${projectId}/debates${query}`, undefined, headers);
};

const createDebate = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/debates`, data, headers);

const updateDebate = (id, data, headers) => socket.patch(`/debates/${id}`, data, headers);

const deleteDebate = (id, headers) => socket.delete(`/debates/${id}`, undefined, headers);

export default {
  transformDebate,
  transformDebateReply,
  getDebates,
  createDebate,
  updateDebate,
  deleteDebate,
};

/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Transformers */

export const transformInfoCard = (infoCard) => ({
  ...infoCard,
  ...(infoCard.createdAt && {
    createdAt: new Date(infoCard.createdAt),
  }),
  ...(infoCard.updatedAt && {
    updatedAt: new Date(infoCard.updatedAt),
  }),
});

/* Actions */

const getInfoCards = (projectId, headers) =>
  socket.get(`/projects/${projectId}/info-cards`, undefined, headers);

const createInfoCard = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/info-cards`, data, headers);

const updateInfoCard = (id, data, headers) => socket.patch(`/info-cards/${id}`, data, headers);

const deleteInfoCard = (id, headers) => socket.delete(`/info-cards/${id}`, undefined, headers);

export default {
  transformInfoCard,
  getInfoCards,
  createInfoCard,
  updateInfoCard,
  deleteInfoCard,
};

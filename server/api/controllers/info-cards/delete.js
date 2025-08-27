/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  INFO_CARD_NOT_FOUND: {
    infoCardNotFound: 'Info card not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    infoCardNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const infoCard = await InfoCard.findOne(inputs.id);
    if (!infoCard) {
      throw Errors.INFO_CARD_NOT_FOUND;
    }

    const project = await Project.findOne(infoCard.projectId);
    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    await InfoCard.destroyOne(inputs.id);

    return {
      item: infoCard,
    };
  },
};

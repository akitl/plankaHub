/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    title: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
    content: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1048576,
      allowNull: true,
    },
    importance: {
      type: 'number',
      min: 1,
      max: 10,
      defaultsTo: 5,
    },
    assignedUserId: {
      ...idInput,
      allowNull: true,
    },
    position: {
      type: 'number',
      min: 0,
      allowNull: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);
    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let { position } = inputs;
    if (position === null || position === undefined) {
      const lastInfoCard = await InfoCard.findOne({
        projectId: inputs.projectId,
      }).sort('position DESC');

      position = lastInfoCard ? lastInfoCard.position + 65536 : 65536;
    }

    const infoCard = await InfoCard.create({
      ...inputs,
      position,
      creatorUserId: currentUser.id,
    }).fetch();

    return infoCard;
  },
};

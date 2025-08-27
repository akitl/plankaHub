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
    status: {
      type: 'string',
      isIn: Object.values(Debate.Statuses),
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

    const criteria = { projectId: inputs.projectId };
    if (inputs.status) {
      criteria.status = inputs.status;
    }

    const debates = await Debate.find(criteria).sort('position ASC');

    const userIds = debates.map((debate) => debate.creatorUserId).filter(Boolean);
    const users = await User.find({ id: userIds });

    return {
      items: debates,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
      },
    };
  },
};

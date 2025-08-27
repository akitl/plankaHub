/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  DEBATE_NOT_FOUND: {
    debateNotFound: 'Debate not found',
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
    title: {
      type: 'string',
      maxLength: 1024,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1048576,
      allowNull: true,
    },
    status: {
      type: 'string',
      isIn: Object.values(Debate.Statuses),
    },
    position: {
      type: 'number',
      min: 0,
    },
  },

  exits: {
    debateNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const debate = await Debate.findOne(inputs.id);
    if (!debate) {
      throw Errors.DEBATE_NOT_FOUND;
    }

    const project = await Project.findOne(debate.projectId);
    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const updateData = _.pick(inputs, ['title', 'description', 'status', 'position']);
    const updatedDebate = await Debate.updateOne(inputs.id).set(updateData);

    return updatedDebate;
  },
};

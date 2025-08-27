/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const toggleFavorites = (isEnabled) => ({
  type: EntryActionTypes.FAVORITES_TOGGLE,
  payload: {
    isEnabled,
  },
});

const toggleEditMode = (isEnabled) => ({
  type: EntryActionTypes.EDIT_MODE_TOGGLE,
  payload: {
    isEnabled,
  },
});

const updateHomeView = (value) => ({
  type: EntryActionTypes.HOME_VIEW_UPDATE,
  payload: {
    value,
  },
});

const logout = (revokeAccessToken = true) => ({
  type: EntryActionTypes.LOGOUT,
  payload: {
    revokeAccessToken,
  },
});

const goTo = (pathname) => ({
  type: EntryActionTypes.GO_TO,
  payload: {
    pathname,
  },
});

const goToProject = (projectId) => ({
  type: EntryActionTypes.GO_TO_PROJECT,
  payload: {
    projectId,
  },
});

export default {
  toggleFavorites,
  toggleEditMode,
  updateHomeView,
  logout,
  goTo,
  goToProject,
};

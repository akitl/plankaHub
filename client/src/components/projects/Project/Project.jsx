/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import ModalTypes from '../../../constants/ModalTypes';
import { ProjectViews } from '../../../constants/Enums';
import ProjectSettingsModal from '../ProjectSettingsModal';
import Boards from '../../boards/Boards';
import BoardSettingsModal from '../../boards/BoardSettingsModal';
import InfoCards from '../../info-cards';

import styles from './Project.module.scss';

const Project = React.memo(() => {
  const modal = useSelector(selectors.selectCurrentModal);
  const { projectView } = useSelector(selectors.selectPath);
  const currentProject = useSelector(selectors.selectCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleTabChange = useCallback(
    (_, { activeIndex }) => {
      const views = [
        ProjectViews.KANBAN,
        ProjectViews.GRID,
        ProjectViews.DEBATES,
        ProjectViews.MEETINGS,
      ];
      const newView = views[activeIndex];

      if (newView === ProjectViews.KANBAN) {
        dispatch(entryActions.goToProject(currentProject.id));
      } else {
        const pathMap = {
          [ProjectViews.GRID]: `/projects/${currentProject.id}/grid`,
          [ProjectViews.DEBATES]: `/projects/${currentProject.id}/debates`,
          [ProjectViews.MEETINGS]: `/projects/${currentProject.id}/meetings`,
        };
        dispatch(entryActions.goTo(pathMap[newView]));
      }
    },
    [dispatch, currentProject],
  );

  const activeTabIndex = (() => {
    switch (projectView) {
      case 'grid':
        return 1;
      case 'debates':
        return 2;
      case 'meetings':
        return 3;
      default:
        return 0;
    }
  })();

  let modalNode = null;
  if (modal) {
    switch (modal.type) {
      case ModalTypes.PROJECT_SETTINGS:
        modalNode = <ProjectSettingsModal />;

        break;
      case ModalTypes.BOARD_SETTINGS:
        modalNode = <BoardSettingsModal />;

        break;
      default:
    }
  }

  const panes = [
    {
      menuItem: t('common.kanban', { context: 'title' }),
      render: () => (
        <Tab.Pane className={styles.tabPane}>
          <Boards />
        </Tab.Pane>
      ),
    },
    {
      menuItem: t('common.grid', { context: 'title' }),
      render: () => (
        <Tab.Pane className={styles.tabPane}>
          <InfoCards />
        </Tab.Pane>
      ),
    },
    {
      menuItem: t('common.debates', { context: 'title' }),
      render: () => (
        <Tab.Pane className={styles.tabPane}>
          <div>Debates component (coming soon)</div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: t('common.meetings', { context: 'title' }),
      render: () => (
        <Tab.Pane className={styles.tabPane}>
          <div>Meetings component (coming soon)</div>
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <div className={styles.wrapper}>
        <Tab
          panes={panes}
          activeIndex={activeTabIndex}
          onTabChange={handleTabChange}
          className={styles.projectTabs}
        />
      </div>
      {modalNode}
    </>
  );
});

export default Project;

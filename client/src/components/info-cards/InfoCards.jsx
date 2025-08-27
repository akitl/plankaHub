/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Container,
  Dropdown,
  Grid,
  Header,
  Input,
  Loader,
  Message,
} from 'semantic-ui-react';

import selectors from '../../selectors';
import api from '../../api';

import styles from './InfoCards.module.scss';

const InfoCards = React.memo(() => {
  const currentProject = useSelector(selectors.selectCurrentProject);
  const [t] = useTranslation();

  const [infoCards, setInfoCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterImportance, setFilterImportance] = useState('');
  const [filterAssignee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInfoCards = useCallback(async () => {
    if (!currentProject) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getInfoCards(currentProject.id);
      setInfoCards(response.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load information cards');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  useEffect(() => {
    fetchInfoCards();
  }, [fetchInfoCards]);

  const getImportanceColor = useCallback((importance) => {
    if (importance <= 3) return 'green';
    if (importance <= 7) return 'yellow';
    return 'red';
  }, []);

  const filteredCards = infoCards.filter((card) => {
    if (filterImportance && card.importance.toString() !== filterImportance) {
      return false;
    }
    if (filterAssignee && card.assignedUserId !== filterAssignee) {
      return false;
    }
    if (searchTerm && !card.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const importanceOptions = [
    { key: '', text: t('common.all'), value: '' },
    ...Array.from({ length: 10 }, (_, i) => ({
      key: i + 1,
      text: `${i + 1}`,
      value: (i + 1).toString(),
    })),
  ];

  if (isLoading) {
    return <Loader active size="big" />;
  }

  if (error) {
    return (
      <Message negative>
        <Message.Header>{t('common.error')}</Message.Header>
        <p>{error}</p>
        <Button onClick={fetchInfoCards}>{t('action.retry')}</Button>
      </Message>
    );
  }

  return (
    <Container fluid className={styles.wrapper}>
      <Header as="h2">
        {t('common.informationGrid', {
          context: 'title',
        })}
      </Header>

      <div className={styles.filters}>
        <Input
          icon="search"
          placeholder={t('action.search')}
          value={searchTerm}
          onChange={(e, { value }) => setSearchTerm(value)}
          className={styles.searchInput}
        />

        <Dropdown
          selection
          options={importanceOptions}
          placeholder={t('common.importance')}
          value={filterImportance}
          onChange={(e, { value }) => setFilterImportance(value)}
          className={styles.filterDropdown}
        />

        <Button primary>{t('action.addCard')}</Button>
      </div>

      <Grid columns={4} stackable className={styles.cardsGrid}>
        {filteredCards.map((infoCard) => (
          <Grid.Column key={infoCard.id}>
            <Card className={styles.infoCard}>
              <Card.Content>
                <Card.Header className={styles.cardHeader}>
                  {infoCard.title}
                  <div
                    className={`${styles.importanceBadge} ${styles[getImportanceColor(infoCard.importance)]}`}
                  >
                    {infoCard.importance}
                  </div>
                </Card.Header>
                {infoCard.content && (
                  <Card.Description className={styles.cardContent}>
                    {infoCard.content}
                  </Card.Description>
                )}
              </Card.Content>
              {infoCard.assignedUserId && (
                <Card.Content extra>
                  <div className={styles.assignee}>
                    {t('common.assignedTo')}: {infoCard.assignedUserId}
                  </div>
                </Card.Content>
              )}
            </Card>
          </Grid.Column>
        ))}
      </Grid>

      {filteredCards.length === 0 && (
        <Message info>
          <Message.Header>{t('common.noInfoCards')}</Message.Header>
          <p>{t('common.createFirstInfoCard')}</p>
        </Message>
      )}
    </Container>
  );
});

export default InfoCards;

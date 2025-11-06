import { useState, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Paper,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  MyLocation as LocationIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useObjectsStore } from '../../stores/RootStore';
import { type TrackedObject } from '../../types';

interface ObjectsListProps {
  onObjectClick?: (object: TrackedObject) => void;
}

type FilterStatus = 'all' | 'active' | 'lost';

export const ObjectsList = observer(({ onObjectClick }: ObjectsListProps) => {
  const objectsStore = useObjectsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredObjects = useMemo(() => {
    let objects = objectsStore.objectsArray;

    if (filterStatus === 'active') {
      objects = objectsStore.activeObjects;
    } else if (filterStatus === 'lost') {
      objects = objectsStore.lostObjects;
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      objects = objects.filter((obj) =>
        obj.id.toLowerCase().includes(query)
      );
    }

    return objects;
  }, [objectsStore.objectsArray, objectsStore.activeObjects, objectsStore.lostObjects, filterStatus, debouncedSearch]);

  const handleFilterChange = useCallback((_event: React.MouseEvent<HTMLElement>, newFilter: FilterStatus | null) => {
    if (newFilter !== null) {
      setFilterStatus(newFilter);
    }
  }, []);

  const formatCoordinate = useCallback((value: number) => value.toFixed(4), []);
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA');
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Список об'єктів
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Пошук по ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={handleFilterChange}
            size="small"
          >
            <ToggleButton value="all">
              Всі ({objectsStore.totalCount})
            </ToggleButton>
            <ToggleButton value="active">
              Активні ({objectsStore.activeCount})
            </ToggleButton>
            <ToggleButton value="lost">
              Втрачені ({objectsStore.lostCount})
            </ToggleButton>
          </ToggleButtonGroup>

          <Chip
            icon={<FilterIcon />}
            label={`Знайдено: ${filteredObjects.length}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Статус</strong></TableCell>
              <TableCell><strong>Координати</strong></TableCell>
              <TableCell><strong>Напрям</strong></TableCell>
              <TableCell><strong>Швидкість</strong></TableCell>
              <TableCell><strong>Оновлено</strong></TableCell>
              <TableCell align="center"><strong>Дії</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredObjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {searchQuery ? 'Нічого не знайдено' : 'Немає об\'єктів'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredObjects.map((obj) => (
                <TableRow
                  key={obj.id}
                  hover
                  sx={{
                    cursor: onObjectClick ? 'pointer' : 'default',
                    '&:hover': onObjectClick ? { backgroundColor: 'action.hover' } : {},
                  }}
                  onClick={() => onObjectClick?.(obj)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {obj.id}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={obj.status === 'active' ? 'Активний' : 'Втрачений'}
                      size="small"
                      color={obj.status === 'active' ? 'success' : 'warning'}
                      sx={{ minWidth: 90 }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {formatCoordinate(obj.latitude)}, {formatCoordinate(obj.longitude)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {obj.direction}°
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {obj.speed.toFixed(1)} км/год
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(obj.lastUpdate)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    {onObjectClick && (
                      <Tooltip title="Показати на карті">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onObjectClick(obj);
                          }}
                        >
                          <LocationIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});


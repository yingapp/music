import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useContext, useState, useMemo } from 'react';
import { AutoSizer, Column, Table } from 'react-virtualized';
import Player from './Player';
import { YingContext } from './lib/react-ying/index';
import useDeepEffect from "./lib/deeply-checked-effect";
import { useWindowSize } from "./lib/hook/hook";
import { getStatusBarHeight } from './lib/util/util'

const styles = (theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  table: {
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
    },
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
  },
  noClick: {
    cursor: 'initial',
  },
});

class MuiVirtualizedTable extends React.PureComponent {

  static defaultProps = {
    headerHeight: 50,
    rowHeight: 50,
  };

  getRowClassName = ({ index }) => {
    const { classes, onRowClick } = this.props;

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });
  };

  cellRenderer = ({ cellData, columnIndex }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props;
    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null,
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
      >
        {cellData}
      </TableCell>
    );
  };

  headerRenderer = ({ label, columnIndex }) => {
    const { headerHeight, columns, classes } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
      >
        <span>{label}</span>
      </TableCell>
    );
  };

  render() {
    const { classes, columns, rowHeight, headerHeight, onRowClick, ...tableProps } = this.props;
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            rowHeight={rowHeight}
            gridStyle={{
              direction: 'inherit',
              outline: 'none',
            }}
            rowStyle={{
              outline: 'none',
            }}
            headerHeight={headerHeight}
            className={classes.table}
            {...tableProps}
            rowClassName={this.getRowClassName}
            onRowClick={onRowClick}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      width: PropTypes.number.isRequired,
    }),
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

export default function ReactVirtualizedTable({ tag, genre, artist }) {
  const { user, sendData } = useContext(YingContext)
  const size = useWindowSize()
  const [data, setData] = useState([]);
  useDeepEffect(() => {
    if (!(tag || genre || artist)) return
    const data = user?.intents?.yinyue?.data
    if (!data) return
    let { sounds = {}, current = {} } = data
    let d = Object.entries(sounds).map(([id, s]) => ({ ...s, id }))
    if (tag === 'artist') {
      d = d.filter(s => !artist || s.artist === artist)
    } else if (tag === 'favorite') {
      d = d.filter(s => s.favorite)
    }
    if (tag !== 'artist' && genre) {
      d = d.filter(s => !genre || s.genre.includes(genre))
    }
    d = d.map(s => {
      if (typeof (s.genre) === 'object') s.genre = s.genre.flat(Infinity)
      if (typeof (s.duration) === 'number') s.duration = formatDuration(s.duration)
      if (s.audio === current.audio) s.playing = '▶'
      if (s.loading === true) s.title += ' 🌍'
      if (s.favorite) s.title += ' 💗'
      return s
    })
    setData(d);
  }, [user, tag, genre, artist])
  function formatDuration(duration) {
    const m = Math.floor(duration / 60)
    const s = Math.floor(duration - m * 60)
    return `${m}:${s}`
  }
  const handleRowClick = (e) => {
    const current = e.rowData
    current.favorite = !!current.favorite
    sendData({ current })
  }
  const columes = useMemo(() => {
    const { width } = size
    const w = width / (width > 500 ? 6 : 4)
    const cols = [
      {
        width: 50,
        label: '',
        dataKey: 'playing',
      },
      {
        width: w * 3 - 50,
        label: '歌曲',
        dataKey: 'title',
      },
      {
        width: w,
        label: '时长',
        dataKey: 'duration',
        numeric: true,
      },

    ]
    if (width > 500) {
      cols.splice(2, 0,
        {
          width: w,
          label: '歌手',
          dataKey: 'artist',
        },
        {
          width: w,
          label: '风格',
          dataKey: 'genre',
        }
      )
    }
    return cols
  }, [size]);
  const height = useMemo(() => size.height - (size.width > 500 ? 0 : 50) - 200 - getStatusBarHeight(), [size])
  return (
    <>
      <div style={{ height, width: '100%' }}>
        <VirtualizedTable
          onRowClick={handleRowClick}
          rowCount={data.length}
          rowGetter={({ index }) => data[index]}
          columns={columes}
        />
      </div>
      <Player data={data} />
    </>
  );
}

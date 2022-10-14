import React from "react";
import styled from "styled-components";
import { useTable } from "react-table";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// import makeData from "./makeData";

const Styles = styled.div`
  padding: 1rem;
  table {
    margin: auto;
    table-layout: fixed;
    width: 90%;
    border-spacing: 0;
    border-collapse: collapse;
    transition: background-color 0.5s ease;
    thead {
      tr {
        :first-child {
          background-color: darkblue;
          color: white;
          th {
            :first-child {
              text-align: left;
            }
            :last-child {
              text-align: right;
            }
          }
        }
      }
    }
    th,
    td {
      margin: 10px;
      padding: 0.5rem;
      height: 30px;
      text-align: center;
      width: 30%;
      :first-child {
        width: 30%;
        input {
          width: auto;
          text-align: left;
        }
      }
      :last-child {
        width: 10%;
        text-align: right;
      }
      input {
        width: 30%;
        text-align: center;
        background-color: inherit;
        font-size: 1rem;
        padding: 5px;
        margin: 0;
        border: 0;
        border-radius: 5px;
        :hover {
          color: white;
          background-color: darkblue;
        }
      }
    }
  }
`;

const EditableNumberCell = props => {
  const { column, row, cell, updateMyData } = props;
  const value = cell.value;
  const rowIndex = row.index;
  const columnId = column.id;
  const onChange = e => {
    updateMyData(rowIndex, columnId, parseInt(e.target.value, 10));
  };
  return <input value={value} onChange={onChange} type="number" />;
};

const EditableTextCell = props => {
  const { column, row, cell, updateMyData } = props;
  const value = cell.value;
  const rowIndex = row.index;
  const columnId = column.id;
  const onChange = e => {
    updateMyData(rowIndex, columnId, e.target.value);
  };
  return <input value={value} onChange={onChange} />;
};

const Tr = styled.tr`
  background-color: white;
  display: ${({ isDragging }) => (isDragging ? "table" : "")};
`;

function Table({
  columns,
  data,
  updateMyData,
  removeRow,
  addRow,
  resetData,
  reorderData
}) {
  const table = useTable({
    columns,
    data,
    // non-API instance pass-throughs
    updateMyData,
    removeRow,
    addRow,
    reorderData
  });
  // console.log({ table });
  const { getTableProps, headerGroups, prepareRow, rows } = table;

  const handleDragEnd = result => {
    const { source, destination } = result;
    if (!destination) return;
    reorderData(source.index, destination.index);
  };

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="table-body">
            {(provided, snapshot) => (
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                    <Draggable
                      draggableId={row.original.id}
                      key={row.original.id}
                      index={row.index}
                    >
                      {(provided, snapshot) => {
                        return (
                          <Tr
                            {...row.getRowProps()}
                            {...provided.draggableProps}
                            // {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            isDragging={snapshot.isDragging}
                          >
                            {row.cells.map(cell => (
                              <td {...cell.getCellProps()}>
                                {cell.render("Cell", {
                                  dragHandleProps: provided.dragHandleProps,
                                  isSomethingDragging: snapshot.isDraggingOver
                                })}
                              </td>
                            ))}
                          </Tr>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                <tr>
                  <td
                    style={{ backgroundColor: "darkblue" }}
                    colSpan={columns.length}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        textAlign: "center"
                      }}
                    >
                      <StyledAddItem addRow={addRow} />
                      <StyledResetData resetData={resetData} />
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </Droppable>
        </DragDropContext>
      </table>
      <pre>{JSON.stringify(rows.map(row => row.values), null, 2)}</pre>
    </>
  );
}

const TrashCan = ({ removeRow, row, className }) => (
  <span
    className={className}
    onClick={() => removeRow(row.index)}
    role="img"
    aria-label="delete"
  >
    🗑️
  </span>
);
const StyledTrashCan = styled(TrashCan)`
  position: absolute;
  top: -20px;
  right: -50px;
  cursor: pointer;
  padding: 15px;
  display: none;
  tr:hover & {
    display: ${({ isSomethingDragging }) =>
      isSomethingDragging ? "none" : "inline"};
  }
`;

const UpDownArrow = props => (
  <span
    {...props.dragHandleProps}
    className={props.className}
    aria-label="move"
    role="img"
  >
    ↕️
  </span>
);
const StyledUpDownArrow = styled(UpDownArrow)`
  position: absolute;
  top: -15px;
  left: -50px;
  padding: 15px;
  display: none;
  tr:hover & {
    display: ${({ isSomethingDragging }) =>
      isSomethingDragging ? "none" : "inline"};
  }
`;

const AddItem = props => (
  <span
    className={props.className}
    onClick={() => props.addRow()}
    role="img"
    aria-label="add"
  >
    1️⃣ Add Item
  </span>
);
const StyledAddItem = styled(AddItem)`
  cursor: pointer;
  color: white;
  margin: 0 10px;
`;

const ResetData = props => (
  <span
    className={props.className}
    onClick={() => props.resetData()}
    role="img"
    aria-label="reset"
  >
    Reset Items 🔁
  </span>
);
const StyledResetData = styled(ResetData)`
  cursor: pointer;
  color: white;
  margin: 0 10px;
`;

function App() {
  const Description = styled.span`
    display: flex;
    align-items: center;
    position: relative;
  `;
  const columns = React.useMemo(() => {
    const DescriptionCell = props => {
      return (
        <Description>
          <StyledUpDownArrow {...props} />
          <EditableTextCell {...props} />
        </Description>
      );
    };
    const Sum = styled.span`
      display: flex;
      justify-content: flex-end;
      align-items: center;
      position: relative;
    `;
    const SumCell = props => {
      return (
        <Sum>
          <StyledTrashCan {...props} />
          {props.row.values.sum}
        </Sum>
      );
    };
    return [
      {
        Header: "Description",
        accessor: "description",
        Cell: DescriptionCell
      },
      {
        Header: "One",
        accessor: "one",
        Cell: EditableNumberCell
      },
      {
        Header: "Two",
        accessor: "two",
        Cell: EditableNumberCell
      },
      {
        Header: "Sum",
        accessor: row => row.one + row.two,
        id: "sum",
        Cell: SumCell
      }
    ];
  }, []);

  const staticData = [
    { id: "item-1", description: "First thing", one: 0, two: 5, sum: 0 },
    { id: "item-2", description: "Second thing", one: 7, two: 1, sum: 0 },
    { id: "item-3", description: "Third thing", one: 2, two: 4, sum: 0 }
  ];

  // const [data, setData] = React.useState(() => makeData(3));
  // const [originalData] = React.useState(data);
  const [data, setData] = React.useState(staticData);
  const [idCount, setIdCount] = React.useState(staticData.length + 1);

  const resetData = () => setData(staticData);
  const removeRow = rowIndex => {
    setData(old => old.filter((row, index) => index !== rowIndex));
  };
  const addRow = () => {
    const one = Math.floor(Math.random() * 10);
    const two = Math.floor(Math.random() * 10);
    const sum = one + two;
    setData(old => [
      ...old,
      {
        id: `item-${idCount}`,
        description: `Thing ${idCount}`,
        one,
        two,
        sum
      }
    ]);
    setIdCount(idCount + 1);
  };
  const updateMyData = (rowIndex, columnID, newValue) => {
    setData(oldData =>
      oldData.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...oldData[rowIndex],
            [columnID]: newValue
          };
        }
        return row;
      })
    );
  };
  const reorderData = (startIndex, endIndex) => {
    const newData = [...data];
    const [movedRow] = newData.splice(startIndex, 1);
    newData.splice(endIndex, 0, movedRow);
    setData(newData);
  };

  return (
    <Styles>
      <Table
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        removeRow={removeRow}
        addRow={addRow}
        resetData={resetData}
        reorderData={reorderData}
      />
    </Styles>
  );
}

export default App;

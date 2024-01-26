import {
  DndContext,
  MeasuringStrategy,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import Item from "./components/Item";
import "./index.css";
import useStorageState from "@/hooks/useStorageState";
import { Button } from "antd";
import AddItem from "./components/AddItem";
import { useRef, useState } from "react";
import { useMemoizedFn } from "ahooks";

export default () => {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useStorageState<BookMark[]>("scripts", []);
  const data = useRef<BookMark>();

  const add = (v: BookMark) => {
    setItems((s) => {
      if (data.current) {
        return s.map((ele) =>
          ele.createTime === data.current?.createTime ? v : ele
        );
      }
      return [v, ...s];
    });
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 20,
      },
    })
  );

  const onEditBookMark = useMemoizedFn((id: string) => {
    data.current = items.find((ele) => ele.createTime === id);
    setVisible(true);
  });

  const onDeleteBookMark = useMemoizedFn((id: string) => {
    setItems((s) => s.filter((item) => item.createTime !== id));
  });

  return (
    <>
      <div>
        <Button
          style={{ float: "left", marginBottom: 16 }}
          onClick={() => {
            data.current = undefined;
            setVisible(true);
          }}
        >
          添加
        </Button>
        {visible && (
          <AddItem
            visible={visible}
            onChange={setVisible}
            onConfirm={add}
            data={data.current}
          />
        )}
      </div>
      <div className="book-mark-container">
        <DndContext
          sensors={sensors}
          onDragEnd={({ active, over }) => {
            if (over) {
              const overIndex = items.findIndex(
                (ele) => ele.createTime == (over.id as string)
              );
              const activeIndex = items.findIndex(
                (ele) => ele.createTime == (active.id as string)
              );
              if (activeIndex !== overIndex) {
                setItems((items) => arrayMove(items, activeIndex, overIndex));
              }
            }
          }}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        >
          <SortableContext items={items.map((ele) => ele.createTime)}>
            {items.map((ele) => (
              <Item
                key={ele.createTime}
                item={ele}
                onEdit={onEditBookMark}
                onDelete={onDeleteBookMark}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
};

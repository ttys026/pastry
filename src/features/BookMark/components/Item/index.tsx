import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { hidePanelAndOpen } from "../../../../utils/paste";
import "./index.css";
import { useContextMenu } from "../../../../hooks/useContextMenu";
import { memo, useRef } from "react";

export default memo(
  ({
    item,
    onEdit,
    onDelete,
  }: {
    item: BookMark;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.createTime });
    const ref = useRef<HTMLDivElement | null>(null);
    useContextMenu(ref, { onEdit, onDelete });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        className="book-mark-item shortcutItem"
        data-index={item.createTime}
        onClick={async () => {
          hidePanelAndOpen(item.link);
        }}
        ref={(node) => {
          ref.current = node;
          setNodeRef(node);
        }}
        style={style}
        {...attributes}
        {...listeners}
      >
        {item.title || "书签"}
      </div>
    );
  }
);

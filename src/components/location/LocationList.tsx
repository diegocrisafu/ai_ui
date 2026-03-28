"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Location, LocationWeather } from "@/lib/types";
import LocationCard from "../weather/LocationCard";
import { GripVertical, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface LocationListProps {
  locations: Location[];
  weatherData: Map<string, LocationWeather>;
  onReorder: (locations: Location[]) => void;
  onRemove: (id: string) => void;
}

function SortableLocationItem({
  location,
  weather,
  isPrimary,
  onRemove,
}: {
  location: Location;
  weather: LocationWeather | undefined;
  isPrimary: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: location.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!weather) {
    return (
      <div ref={setNodeRef} style={style} className="relative">
        <div className="backdrop-blur-xl rounded-2xl border bg-white/5 border-white/10 p-5 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
          <div className="h-8 bg-white/10 rounded w-1/2 mb-2" />
          <div className="h-3 bg-white/10 rounded w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10">
        <button
          {...attributes}
          {...listeners}
          className="text-white/40 hover:text-white/70 cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-white/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <LocationCard data={weather} isPrimary={isPrimary} />
    </div>
  );
}

export default function LocationList({
  locations,
  weatherData,
  onReorder,
  onRemove,
}: LocationListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = locations.findIndex((loc) => loc.id === active.id);
      const newIndex = locations.findIndex((loc) => loc.id === over.id);
      onReorder(arrayMove(locations, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={locations.map((loc) => loc.id)}
        strategy={verticalListSortingStrategy}
      >
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {locations.map((location, index) => (
            <SortableLocationItem
              key={location.id}
              location={location}
              weather={weatherData.get(location.id)}
              isPrimary={index === 0}
              onRemove={() => onRemove(location.id)}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
}

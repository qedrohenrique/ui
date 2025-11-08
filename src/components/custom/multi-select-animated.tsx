"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Separator } from "../ui/separator";

export interface ContentItem {
  id: number;
  content: string;
}

export interface MultiSelectAnimatedProps {
  options: ContentItem[];
  initialSelectedItems: ContentItem[];
  placeholder: string;
  onSelect?: (item: ContentItem) => void;
  onDeselect?: (item: ContentItem) => void;
  triggerClassName?: string;
  maxItems?: number;
}

export default function MultiSelectAnimated({
  options,
  initialSelectedItems = [],
  placeholder,
  onSelect,
  onDeselect,
  triggerClassName,
  maxItems = 3,
}: MultiSelectAnimatedProps) {
  const [selectedItems, setSelectedItems] =
    useState<ContentItem[]>(initialSelectedItems);
  const [searchTerm, setSearchTerm] = useState("");

  const handleItemClick = (item: ContentItem) => {
    if (selectedItems.find((selected) => selected.id === item.id)) {
      removeItem(item);
    } else {
      addItem(item);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === options.length) {
      selectedItems.forEach((item) => {
        onDeselect?.(item);
      });
      setSelectedItems([]);
    } else {
      const itemsToAdd = options.filter(
        (option) => !selectedItems.find((selected) => selected.id === option.id)
      );
      itemsToAdd.forEach((item) => {
        onSelect?.(item);
      });
      setSelectedItems(options);
    }
  };

  const addItem = (item: ContentItem) => {
    if (!selectedItems.find((selected) => selected.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
    onSelect?.(item);
  };

  const removeItem = (item: ContentItem) => {
    setSelectedItems(
      selectedItems.filter((selected) => selected.id !== item.id)
    );
    onDeselect?.(item);
  };

  const filteredOptions = options.filter((item) =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extraCount = Math.max(selectedItems.length - maxItems, 0);
  const displayedItems = selectedItems.slice(0, maxItems);

  return (
    <div id="example">
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={`min-h-[40px] h-auto px-4 gap-2 text-muted-foreground rounded-md py-2 hover:cursor-pointer
                border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50
                 ${triggerClassName}`}
            >
              <AnimatePresence mode="wait">
                {selectedItems.length === 0 ? (
                  <div className="flex items-center justify-between w-full">
                    <motion.span
                      key="placeholder"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      {placeholder}
                    </motion.span>
                    <ChevronDown className="h-4 w-4 ml-4" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                      <AnimatePresence>
                        {displayedItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{
                              x: -20,
                              opacity: 0,
                              scale: 0.8,
                            }}
                            animate={{
                              x: 0,
                              opacity: 1,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.8,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                              delay: index * 0.1,
                            }}
                            layout
                            className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            <span>{item.content}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(item);
                              }}
                              className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                        {extraCount > 0 && (
                          <motion.div
                            key="extra-count"
                            initial={{ x: -20, opacity: 0, scale: 0.8 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                              delay: displayedItems.length * 0.1,
                            }}
                            layout
                            className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            <span>{`+${extraCount} more`}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        key="close-all"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectedItems.forEach((item) => {
                            onDeselect?.(item);
                          });
                          setSelectedItems([]);
                        }}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                      <Separator orientation="vertical" className="!h-4" />
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            {options.length > 0 ? (
              <>
                <div className="flex items-center justify-center px-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 border-0 !bg-transparent focus-visible:ring-0 focus-visible:border-0 px-1.5"
                  />
                </div>
                <Separator />
                <div className="max-h-60 overflow-y-auto">
                  {filteredOptions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`px-2 py-2 cursor-pointer transition-colors ${
                        selectedItems.find(
                          (selected) => selected.id === item.id
                        )
                          ? "bg-primary/10 "
                          : "hover:bg-muted"
                      }`}
                    >
                      {item.content}
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSelectAll()}
                    className="w-full rounded-none"
                  >
                    {selectedItems.length === options.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground py-6 px-2">
                  No options found
                </p>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

import { pgTable, real, text, timestamp } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userIdn: text("user_idn").notNull().default(""),
  isMinimized: text("is_minimized").notNull().default("false"),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  zIndex: real("z_index").notNull().default(0),
  color: text("color").notNull().default("#ffffff"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

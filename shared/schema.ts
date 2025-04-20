import { pgTable, text, serial, timestamp, integer, uniqueIndex, primaryKey, boolean, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Recipe cache table
export const recipeCaches = pgTable("recipe_caches", {
  id: serial("id").primaryKey(),
  ingredients: text("ingredients").notNull(), // Comma-separated ingredients list
  result: text("result").notNull(), // JSON string of the recipe results
  createdAt: timestamp("created_at").defaultNow().notNull(), // ISO Date string
});

// Recipe cache schemas
export const insertRecipeCacheSchema = createInsertSchema(recipeCaches).omit({
  id: true,
  createdAt: true,
});

export type InsertRecipeCache = z.infer<typeof insertRecipeCacheSchema>;
export type RecipeCache = typeof recipeCaches.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").unique(), // دعم تسجيل الدخول باستخدام Firebase

  // User preferences
  preferences: json("preferences").$type<{
    theme?: 'light' | 'dark' | 'system';
    notificationsEnabled?: boolean;
    favoriteCuisine?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  userIngredients: many(userIngredients),
  recipes: many(recipes),
  savedRecipes: many(savedRecipes)
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  photoURL: true,
  firebaseUid: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;



// Ingredients table
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  userIngredients: many(userIngredients),
}));

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  createdAt: true,
});

export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredients.$inferSelect;

// User Ingredients (saved ingredients for users)
export const userIngredients = pgTable("user_ingredients", {
  userId: integer("user_id").notNull().references(() => users.id),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredients.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.ingredientId] }),
  };
});

export const userIngredientsRelations = relations(userIngredients, ({ one }) => ({
  user: one(users, {
    fields: [userIngredients.userId],
    references: [users.id],
  }),
  ingredient: one(ingredients, {
    fields: [userIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

export const insertUserIngredientSchema = createInsertSchema(userIngredients).omit({
  createdAt: true,
});

export type InsertUserIngredient = z.infer<typeof insertUserIngredientSchema>;
export type UserIngredient = typeof userIngredients.$inferSelect;

// Recipes table - for user saved/favorite recipes
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients").notNull(), // JSON string of ingredients
  instructions: text("instructions").notNull(), // JSON string of instructions
  cuisine: text("cuisine"),
  difficulty: text("difficulty").default("medium"), // Easy, Medium, Hard
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  videoId: text("video_id"),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipesRelations = relations(recipes, ({ one }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  })
}));

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

// Community Posts table
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  tags: text("tags").array().default([]),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  postType: text("post_type").default("general").notNull(), // general, recipe
  recipeId: integer("recipe_id").references(() => recipes.id),
  isLikedByUser: boolean("is_liked_by_user").default(false),
  isFeatured: boolean("is_featured").default(false),
  userName: text("user_name"), // اسم المستخدم المقدم من Google
  userAvatar: text("user_avatar"), // رابط صورة المستخدم المقدمة من Google
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [communityPosts.recipeId],
    references: [recipes.id],
  })
}));

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  comments: true,
  shares: true,
  isLikedByUser: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Community Post Comments table
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(communityPosts, {
    fields: [postComments.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
}));

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

// جدول الوصفات المحفوظة للمستخدم
export const savedRecipes = pgTable("saved_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recipeData: json("recipe_data").$type<{
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    imageUrl?: string;
    source?: string;
    videoId?: string;
  }>().notNull(),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedRecipesRelations = relations(savedRecipes, ({ one }) => ({
  user: one(users, {
    fields: [savedRecipes.userId],
    references: [users.id],
  }),
}));

export const insertSavedRecipeSchema = createInsertSchema(savedRecipes).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedRecipe = z.infer<typeof insertSavedRecipeSchema>;
export type SavedRecipe = typeof savedRecipes.$inferSelect;

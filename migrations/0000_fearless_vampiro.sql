CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher1_id" integer NOT NULL,
	"teacher2_id" integer NOT NULL,
	"match_type" text NOT NULL,
	"distance" numeric(8, 2),
	"score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"subjects" json NOT NULL,
	"grade_level" text NOT NULL,
	"phone_number" text NOT NULL,
	"current_school" text NOT NULL,
	"current_school_address" text,
	"current_district" text NOT NULL,
	"current_latitude" numeric(10, 8),
	"current_longitude" numeric(11, 8),
	"current_school_latitude" numeric(10, 8),
	"current_school_longitude" numeric(11, 8),
	"home_district" text NOT NULL,
	"home_latitude" numeric(10, 8),
	"home_longitude" numeric(11, 8),
	"preferred_districts" json NOT NULL,
	"preferred_location_latitude" numeric(10, 8),
	"preferred_location_longitude" numeric(11, 8),
	"max_distance" integer DEFAULT 100,
	"hide_contact" boolean DEFAULT true,
	"allow_requests" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT true,
	"experience" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transfer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_teacher_id" integer NOT NULL,
	"to_teacher_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_teacher1_id_teachers_id_fk" FOREIGN KEY ("teacher1_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_teacher2_id_teachers_id_fk" FOREIGN KEY ("teacher2_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_from_teacher_id_teachers_id_fk" FOREIGN KEY ("from_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_to_teacher_id_teachers_id_fk" FOREIGN KEY ("to_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;
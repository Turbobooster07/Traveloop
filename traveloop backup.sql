--
-- PostgreSQL database dump
--

\restrict 4oh6QnbXMNsUdu2cQ6LhvITWLUPxEFlaqTHzz5cZRFjG2VqtRQITOPcbhyackeo

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

-- Started on 2026-05-10 10:56:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 219 (class 1255 OID 16421)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16405)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50),
    password_hash character varying(255) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    city character varying(100),
    country character varying(100),
    additional_info text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16404)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4743 (class 2604 OID 16408)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4901 (class 0 OID 16405)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, first_name, last_name, email, phone, city, country, additional_info, created_at, updated_at) FROM stdin;
1	ayaan1678	$2b$10$2xNyqQTKn6MXhbTWTFir5e7VMeS/QIO71rv9al1Qej/skoi29dLWK	Ayaan	S	ayaanshaikh4950@gmail.com	9510447359	Vadodara	India	HEllo	2026-05-10 10:20:37.509823+05:30	2026-05-10 10:20:37.509823+05:30
2	veer6684	$2b$10$WpcUfnRIPZjrujWf4n7bzecD.sBHecre62ge3hrXKJ72RsRzPHhQi	Veer	Patel	ayaans@gmail.com	+91 9510447359	Vadodara	India		2026-05-10 10:42:31.32898+05:30	2026-05-10 10:42:31.32898+05:30
\.


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4749 (class 2606 OID 16418)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4751 (class 2606 OID 16414)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4753 (class 2606 OID 16416)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4746 (class 1259 OID 16419)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4747 (class 1259 OID 16420)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 4754 (class 2620 OID 16422)
-- Name: users update_user_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Completed on 2026-05-10 10:56:47

--
-- PostgreSQL database dump complete
--

\unrestrict 4oh6QnbXMNsUdu2cQ6LhvITWLUPxEFlaqTHzz5cZRFjG2VqtRQITOPcbhyackeo


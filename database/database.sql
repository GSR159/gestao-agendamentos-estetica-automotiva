--
-- PostgreSQL database dump
--

\restrict vvv3MiE0bcCSHasSVz7A8Mm8FmmK22h1d2RU8cV4FsOXs5EpSqr6d46mvdhQike

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.1

-- Started on 2026-04-02 23:44:44

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
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16444)
-- Name: agendamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agendamentos (
    id integer NOT NULL,
    cliente_id integer,
    veiculo_id integer,
    servico_id integer,
    data timestamp without time zone,
    status character varying(50),
    duracao_minutos integer
);


ALTER TABLE public.agendamentos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16443)
-- Name: agendamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agendamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agendamentos_id_seq OWNER TO postgres;

--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 225
-- Name: agendamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agendamentos_id_seq OWNED BY public.agendamentos.id;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nome character varying(300) NOT NULL,
    telefone character varying(20),
    email character varying(100),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 219
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- TOC entry 224 (class 1259 OID 16413)
-- Name: servicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicos (
    id integer NOT NULL,
    nome character varying(100),
    preco numeric(10,2),
    descricao character varying(600),
    duracao_minutos integer
);


ALTER TABLE public.servicos OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16412)
-- Name: servicos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicos_id_seq OWNER TO postgres;

--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 223
-- Name: servicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servicos_id_seq OWNED BY public.servicos.id;


--
-- TOC entry 228 (class 1259 OID 24577)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(100),
    senha character varying(100),
    tipo character varying(20)
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24576)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 222 (class 1259 OID 16400)
-- Name: veiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.veiculos (
    id integer NOT NULL,
    cliente_id integer,
    modelo character varying(100),
    placa character varying(10),
    cor character varying(50),
    ano integer,
    marca character varying(50)
);


ALTER TABLE public.veiculos OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16399)
-- Name: veiculos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.veiculos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.veiculos_id_seq OWNER TO postgres;

--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 221
-- Name: veiculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.veiculos_id_seq OWNED BY public.veiculos.id;


--
-- TOC entry 4779 (class 2604 OID 16447)
-- Name: agendamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendamentos ALTER COLUMN id SET DEFAULT nextval('public.agendamentos_id_seq'::regclass);


--
-- TOC entry 4775 (class 2604 OID 16393)
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 16416)
-- Name: servicos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicos ALTER COLUMN id SET DEFAULT nextval('public.servicos_id_seq'::regclass);


--
-- TOC entry 4780 (class 2604 OID 24580)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 16403)
-- Name: veiculos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veiculos ALTER COLUMN id SET DEFAULT nextval('public.veiculos_id_seq'::regclass);


--
-- TOC entry 4951 (class 0 OID 16444)
-- Dependencies: 226
-- Data for Name: agendamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agendamentos (id, cliente_id, veiculo_id, servico_id, data, status, duracao_minutos) FROM stdin;
11	3	3	1	2026-04-10 11:00:00	pendente	60
12	1	1	2	2026-04-10 12:00:00	pendente	120
13	1	1	3	2026-04-03 10:00:00	pendente	150
14	1	1	2	2026-04-04 14:00:00	aprovado	120
\.


--
-- TOC entry 4945 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nome, telefone, email, criado_em) FROM stdin;
1	Guilherme Rocha	11999999999	gui@email.com	2026-03-18 21:19:50.692676
2	Guilherme Rocha	11999999999	gui@email.com	2026-03-19 10:45:29.960683
3	Gabriel Pereira	1195087-9987	gabs123@email.com	2026-04-02 21:18:50.857798
\.


--
-- TOC entry 4949 (class 0 OID 16413)
-- Dependencies: 224
-- Data for Name: servicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicos (id, nome, preco, descricao, duracao_minutos) FROM stdin;
1	Lavagem simples	80.00	\N	60
2	Lavagem Completa	80.00	\N	120
3	Lavagem com cera básica	80.00	\N	150
4	Lavagem com cera premium	80.00	\N	180
5	Lavagem com cera express	80.00	Lavagem externa e interna	90
\.


--
-- TOC entry 4953 (class 0 OID 24577)
-- Dependencies: 228
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, senha, tipo) FROM stdin;
1	Smartsystem@admin.com	cleiton123@	admin
2	agendamento@cliente.com	mikasa13	cliente
3	admin@admin.com	$2b$10$prmbOMq5C9GhIZ7QMZQDT.nLKcTTzVU/UN5PtMBEhosnIrGZ9ZpNu	admin
\.


--
-- TOC entry 4947 (class 0 OID 16400)
-- Dependencies: 222
-- Data for Name: veiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.veiculos (id, cliente_id, modelo, placa, cor, ano, marca) FROM stdin;
1	1	Honda CR-V	FAB8E75	Preto	\N	\N
2	1	Civic	ABC1D23	Preto	2020	Honda
3	3	Honda Civic	ABV8E99	Branco	\N	\N
\.


--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 225
-- Name: agendamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agendamentos_id_seq', 14, true);


--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 219
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 3, true);


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 223
-- Name: servicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicos_id_seq', 6, true);


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 221
-- Name: veiculos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.veiculos_id_seq', 3, true);


--
-- TOC entry 4788 (class 2606 OID 16450)
-- Name: agendamentos agendamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 4782 (class 2606 OID 16398)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 16419)
-- Name: servicos servicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicos
    ADD CONSTRAINT servicos_pkey PRIMARY KEY (id);


--
-- TOC entry 4790 (class 2606 OID 24585)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4792 (class 2606 OID 24583)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4784 (class 2606 OID 16406)
-- Name: veiculos veiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veiculos
    ADD CONSTRAINT veiculos_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 16451)
-- Name: agendamentos agendamentos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- TOC entry 4795 (class 2606 OID 16461)
-- Name: agendamentos agendamentos_servico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_servico_id_fkey FOREIGN KEY (servico_id) REFERENCES public.servicos(id);


--
-- TOC entry 4796 (class 2606 OID 16456)
-- Name: agendamentos agendamentos_veiculo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.veiculos(id);


--
-- TOC entry 4793 (class 2606 OID 16407)
-- Name: veiculos veiculos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veiculos
    ADD CONSTRAINT veiculos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


-- Completed on 2026-04-02 23:44:44

--
-- PostgreSQL database dump complete
--

\unrestrict vvv3MiE0bcCSHasSVz7A8Mm8FmmK22h1d2RU8cV4FsOXs5EpSqr6d46mvdhQike


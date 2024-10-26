insert into sports (id, name, `order`) values ('27e78fc6-a638-4a49-b2b8-2829874c6666', 'College Football', 1);

insert into sport_seasons
    (id, sport_id, name, start_time, end_time, active)
VALUES (
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        '27e78fc6-a638-4a49-b2b8-2829874c6666', -- (select s.id from sports s where s.name = 'College Football'),
        '2024',
        1724126400,
        1737435600,
        1
        );

insert into sport_weeks (id, season_id, name, start_time, end_time, default_start)
VALUES (
    'd378b73d-7c01-4bcb-a59d-27be7e051216',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 0',
        1737954000,
        1724731200,
        1
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '3b5bba1e-21d7-4767-9144-91843a4a7c27',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 1',
        1724731200,
        1725336000
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '76d6907d-6608-4efe-8815-43b0a3b65618',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 2',
        1725336000,
        1725940800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '24f6fb6b-0588-4695-a536-e9286545311c',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 3',
        1725940800,
        1726545600
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '0e215e4d-4b88-45a8-b3a5-b2bd3af0f77e',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 4',
        1726545600,
        1727150400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'c34e1eda-78ca-4fe3-9516-f97f65628f1a',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 5',
        1727150400,
        1727755200
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'f797cff5-431f-4b8d-b519-5c56f13286f6',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 6',
        1727755200,
        1728360000
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'd8483639-ec74-4d44-b95a-f65a17d986a6',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 7',
        1728360000,
        1728964800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '9c8eb3f6-8095-437c-bb97-929761848101',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 8',
        1728964800,
        1729569600
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'e371ad5d-01d1-4cef-be56-fa42e4a10132',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 9',
        1729569600,
        1730174400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '3d19c23b-e4bb-429b-a0e6-fd63a505c797',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 10',
        1730174400,
        1730782800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '24c748d4-cbd5-4dec-93b0-e3a7393b3af6',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 11',
        1730782800,
        1731474000
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'a996f2be-0431-4e89-bcfa-3b5af5696f2d',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 12',
        1731474000,
        1732078800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '6a63ef77-230a-46a4-80d5-e091bb412084',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 13',
        1732078800,
        1732683600
       );
insert into sport_weeks (id, season_id, name, start_time, end_time, default_end)
VALUES (
    '77e2f6fc-ed34-4c82-84aa-1c0fc78c14a2',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Week 14',
        1732683600,
        1733202000,
        1
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'fe76ba1f-f77e-4406-957a-b4b8235287da',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Conference Championship',
        1733202000,
        1733806800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'b73abffc-cf35-433d-87ce-d2f2aac1d411',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'First Round',
        1734411600,
        1735016400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'e05e2c6c-18ef-4cc6-ad0b-d7067176b2a7',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Quarterfinals',
        1735016400,
        1735794000
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'b651d8f8-2353-47df-8e5c-b859cdd20e7e',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'Semifinals',
        1735794000,
        1736830800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'c99074ad-bbb7-4c80-9139-5c8fe31bcc0d',
        '3a42f920-517e-4b97-8a31-4f0a86f6dcf7',
        'National Championship',
        1736830800,
        1737435600
       );
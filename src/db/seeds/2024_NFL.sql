insert into sports (id, name, `order`) values ('0eaf1d79-02fb-4dca-a44b-cfc5ce935c0a', 'NFL', 0);

insert into sport_seasons
    (id, sport_id, name, start_time, end_time, active)
VALUES (
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        '0eaf1d79-02fb-4dca-a44b-cfc5ce935c0a', -- (select s.id from sports s where s.name = 'NFL'),
        '2024',
        1725582000,
        1739163600,
        1
        );

insert into sport_weeks (id, season_id, name, start_time, end_time, default_start)
VALUES (
    '6e20f116-f272-42db-a7f5-574deae31742',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 1',
        1725582000,
        1725940800,
        true
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'e8a32254-6ab5-4253-838e-5120da184422',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 2',
        1725940800,
        1726545600
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '0395a516-89eb-4029-8032-6ab0e95d442e',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 3',
        1726545600,
        1727150400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'fdc284d4-f9f1-4e06-906f-c1fd97496c68',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 4',
        1727150400,
        1727755200
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '5591f345-df08-4025-8427-52a9090c2e75',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 5',
        1727755200,
        1728360000
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'ee42acdf-fe20-49ad-8ea4-ad803819502b',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 6',
        1728360000,
        1728964800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'abc74fc4-3824-460b-b250-cae7c9bbf9fe',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 7',
        1728964800,
        1729569600
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '9b962008-7815-47f0-9ea3-2cdc6d111f05',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 8',
        1729569600,
        1730174400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '30b83877-fb71-4053-aebe-e55a68ea0ec0',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 9',
        1730174400,
        1730782800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '8532d413-5fba-472e-88e3-01e6b3356ac5',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 10',
        1730782800,
        1731387600
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '222e3872-be77-496d-b2ff-84d48c98c162',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 11',
        1731387600,
        1731992400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'f0afb113-21f5-4714-bd55-63f64a440b8f',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 12',
        1731992400,
        1732597200
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '608ee13b-d8d6-4346-bb5e-c6aaf903982a',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 13',
        1732597200,
        1733202000
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '98e0aa3e-9236-4311-9324-781df9ef34a5',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 14',
        1733202000,
        1733806800
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'b96d3cf0-f23f-4cd6-abfd-bac0be9e223b',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 15',
        1733806800,
        1734411600
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '6a492934-2805-491d-b5bd-6cd072d4c886',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 16',
        1734411600,
        1735016400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'bc4fd0b9-b0bd-420a-bc8a-57b5cb50d690',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 17',
        1735016400,
        1735621200
       );
insert into sport_weeks (id, season_id, name, start_time, end_time, default_end)
VALUES (
    '229e32fd-0e37-4139-8df2-465f9a2b1a7b',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Week 18',
        1735621200,
        1736139600,
        1
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '615191b4-9702-4483-b5d5-bb2441994cea',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Wild Card',
        1736139600,
        1736744400
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '305c5821-4620-497b-8342-88882330fe8e',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Divisional',
        1736744400,
        1737349200
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    'd5711d43-c899-406c-ab64-fecf1da19d2b',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Conference',
        1737349200,
        1737954000
       );
insert into sport_weeks (id, season_id, name, start_time, end_time)
VALUES (
    '1cefada0-ed9f-4464-bba3-0a30b6223510',
        'e8f4e788-eda2-4ae0-86b9-d9cb926e0292',
        'Super Bowl',
        1737954000,
        1739163600
       );
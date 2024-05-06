//setting up keys and their values for development
module.exports = {
	
	'STATUS': {'INACTIVE': 0 , 'ACTIVE': 1, 'DE_ACTIVE': 2},
	'WORKOUT_STATUS': {'INACTIVE': 0 , 'PUBLISHED': 1, 'DRAFT': 2},
	'PAGE_DATA_LIMIT': 10,
	'DATA_LIMIT': 6,
	'PAGE': 1,
	'LIMIT': 10,
	'DEFAULT_LANGUAGE': "en",
	'APP_LANGUAGE': ['en', 'hn'],
	'URL_EXPIRE_TIME': '2h',
	'USER_TYPE': {
		'ADMIN': 1,
		'USER': 2,
		'TEMPLE': 3,
		'GURU':4
	},

	'PROGRAM_TYPE': {
		'ON_SEASON': 1,
		'OFF_SEASON': 2,
		'ALL_SEASON': 3
	},
	'THEME_TYPE': {
		'WHITE': 1,
		'BLACK': 2	
	},
	'STATUS_CODE': {
		'SUCCESS': '1',
		'FAIL': '0',
		'VALIDATION': '2',
		'UNAUTHENTICATED': '-1',
		'NOT_FOUND': '-2'
	},
	'WEB_STATUS_CODE': {
		'OK': 200,
		'CREATED': 201,
		'NO_CONTENT': 204,
		'BAD_REQUEST': 400,
		'UNAUTHORIZED': 401,
		'NOT_FOUND': 404,
		'SERVER_ERROR': 500
	},
	'LANG': {
		'HINDI': 'hn',
		'ENGLISH': 'en'
	}
}
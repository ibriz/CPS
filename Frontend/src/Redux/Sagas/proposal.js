// import { call, put, takeLatest } from 'redux-saga/effects';
// import {
//   getCourseInfo,
//   getCourseCareer,
//   getCourseRequirement,
//   getCourseFee,
//   loadAllCourseData,
// } from '../services/api';
// import courseActions, { Types } from '../actions/course';

// function* getCourseInfoRequest() {
//   try {
//     const response = yield call(getCourseInfo);
//     yield put(courseActions.getCourseInfoSuccess(response.data));
//   } catch (error) {
//     yield put(courseActions.getCourseInfoFailure());
//   }
// }import { call, put, takeLatest } from 'redux-saga/effects';
// import {
//   getCourseInfo,
//   getCourseCareer,
//   getCourseRequirement,
//   getCourseFee,
//   loadAllCourseData,
// } from '../services/api';
// import courseActions, { Types } from '../actions/course';

// function* getCourseInfoRequest() {
//   try {
//     const response = yield call(getCourseInfo);
//     yield put(courseActions.getCourseInfoSuccess(response.data));
//   } catch (error) {
//     yield put(courseActions.getCourseInfoFailure());
//   }
// }

// function* proposalWatcher() {
//   yield takeLatest(Types.GET_COURSE_INFO_REQUEST, getCourseInfoRequest);
// }

// export default proposalWatcher;

// function* proposalWatcher() {
//   yield takeLatest(Types.GET_COURSE_INFO_REQUEST, getCourseInfoRequest);
// }

// export default proposalWatcher;

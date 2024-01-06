import { JobModel, SessionModel, UserModel } from '../models';
import makeJobRepo from './job';
import makeSessionRepo from './session';
import makeUserRepo from './user';

const jobRepository = makeJobRepo({ job: JobModel });
const sessionRepository = makeSessionRepo({ session: SessionModel });
const userRepository = makeUserRepo({ user: UserModel });

export { sessionRepository, userRepository, jobRepository };

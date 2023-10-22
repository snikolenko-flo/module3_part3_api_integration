import { DynamoDB } from '../backend/services/dynamo.service';
import { defaultUsersArray } from './default.users';
import { Database } from '../backend/interfaces/database';

const dbService: Database = new DynamoDB();

(async () => {
  await dbService.addDefaultUsersToDB(defaultUsersArray);
})();

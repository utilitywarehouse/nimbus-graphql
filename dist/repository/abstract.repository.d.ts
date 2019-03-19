import { RepositoryContext } from './repository.context';
import { CheckerReporter } from '../operational';
export declare abstract class AbstractRepository {
    abstract withContext(context: RepositoryContext): AbstractRepository;
    abstract checkHealth(cr: CheckerReporter): any;
}

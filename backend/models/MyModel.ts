
import _ from 'lodash';

class MyModel<T extends Record<string,unknown>>{
    private table:(T & {['id']:string})[] = [];
    private idCurrent = 0;

    public save(record:T):typeof this.table[0]{
        ++this.idCurrent;
        const newRecord = {...record, id:this.idCurrent.toString()};
        this.table.push(newRecord);
        return newRecord;
    }

    public findAll(): typeof this.table[0][]{
        return _.cloneDeep(this.table);
    }

    public find(query:Partial<typeof this.table[0]>): typeof this.table[0][]{
        const compareKeys = _.keys(query);
        const compareValues = _.pick(query,compareKeys);

        return this.table.filter(record => {
            const recordValues = _.pick(record,compareKeys);
            return _.isEqual(recordValues,compareValues);
        });
    }

    /*public findOr(query:Partial<typeof this.table[0]>): typeof this.table[0][]{
        return _.flattenDeep(
            Object.entries(query)
            .map(([key,value]) => this.find({[key]:value}))
        );
    }*/
}
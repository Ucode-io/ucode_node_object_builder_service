const RelationStore = require("./relation");
const catchWrapDb = require("../../helper/catchWrapDb");
const { struct } = require("pb-util");
const mongoPool = require("../../pkg/pool");

let NAMESPACE = "storage.cascading";

let cascaderStore = {
    getCascadingList: catchWrapDb(
        `${NAMESPACE}.getCascadingList`,
        async (data) => {
            try {
                const mongoConn = await mongoPool.get(data.project_id);
                const table = mongoConn.models["Table"];
                const Field = mongoConn.models["Field"];
                const Relation = mongoConn.models["Relation"];

                let response;
                let resp = await RelationStore.getAll({
                    table_slug: data.table_slug,
                    relation_table_slug: data.table_slug,
                    project_id: data.project_id,
                });
                let cascadings = [];
                for (const relation of resp.relations) {
                    let validObject = {};
                    let table = {};
                    if (relation.type !== "Many2Dynamic") {
                        if (relation.type === "Many2Many") {
                            validObject.id = relation.id;
                            validObject.type = relation.type;
                            if (relation.table_from.slug === data.table_slug) {
                                table.slug = relation.table_to.slug;
                                table.label = relation.table_to.label;
                                table.id = relation.table_to.id;

                                validObject.table = table;
                                validObject.field_slug = relation.field_from;
                            } else if (
                                relation.table_to.slug === data.table_slug
                            ) {
                                table.slug = relation.table_from.slug;
                                table.label = relation.table_from.label;
                                table.id = relation.table_from.id;

                                validObject.table = table;
                                validObject.field_slug = relation.field_to;
                            }
                        } else if (relation.type !== "Recursive") {
                            if (relation.table_from.slug === data.table_slug) {
                                table.slug = relation.table_to.slug;
                                table.label = relation.table_to.label;
                                table.id = relation.table_to.id;

                                validObject.id = relation.id;
                                validObject.table = table;
                                validObject.type = relation.type;
                                validObject.field_slug = relation.field_from;
                            }
                        } else {
                            table.slug = relation.table_from.slug;
                            table.label = relation.table_from.label;
                            table.id = relation.table_from.id;

                            validObject.id = relation.id;
                            validObject.table = table;
                            validObject.type = relation.type;
                            validObject.field_slug = relation.field_to;
                        }
                    }
                    if (validObject.id) {
                        cascadings.push(validObject);
                    }
                }
                response = struct.encode({ cascadings });
                return { table_slug: data.table_slug, data: response };
            } catch (err) {
                throw err;
            }
        }
    ),
};

module.exports = cascaderStore;

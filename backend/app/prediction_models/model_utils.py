def add_denial_rate_feature(X_train, X_test, pair_column, feature_name):
    pair_stats = (
        X_train
        .groupby(pair_column)
        .size()
        .reset_index(name="count")
    )

    pair_stats[feature_name] = (pair_stats["count"] / pair_stats["count"].sum())

    # Merge into train
    X_train = X_train.merge(
        pair_stats[[pair_column, feature_name]],
        on=pair_column,
        how="left"
    )

    # Merge into test
    X_test = X_test.merge(
        pair_stats[[pair_column, feature_name]],
        on=pair_column,
        how="left"
    )

    # Fill missing
    global_rate = pair_stats[feature_name].mean()

    X_train[feature_name] = X_train[feature_name].fillna(global_rate)

    X_test[feature_name] = X_test[feature_name].fillna(global_rate)

    return X_train, X_test
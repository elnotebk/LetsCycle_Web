<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\UserList;

/** Stores one collection per account, rewriting the file under a lock. */
abstract class FileUserListRepository extends JsonLinesRepository implements UserListRepositoryInterface
{
    /** Creates the empty collection for an account. */
    abstract protected function createEmpty(int $userId): UserList;

    public function findByUser(int $userId): UserList
    {
        return $this->withLock(LOCK_SH, function () use ($userId): UserList {
            /** @var UserList[] $lists */
            $lists = $this->readAll();
            foreach ($lists as $list) {
                if ($list->userId === $userId) {
                    return $list;
                }
            }
            return $this->createEmpty($userId);
        });
    }

    public function update(int $userId, callable $change): UserList
    {
        return $this->withLock(LOCK_EX, function () use ($userId, $change): UserList {
            /** @var UserList[] $lists */
            $lists = $this->readAll();
            $list = $this->createEmpty($userId);
            foreach ($lists as $index => $candidate) {
                if ($candidate->userId === $userId) {
                    $list = $candidate;
                    unset($lists[$index]);
                }
            }

            $change($list);
            $lines = array_map(fn (UserList $saved): string => $this->toLine($saved), [...$lists, $list]);
            file_put_contents($this->file, implode('', $lines));
            return $list;
        });
    }
}
